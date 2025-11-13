const { executeQuery } = require('../config/database');
const response = require('../utils/response');
const { getAuditValues } = require('../middleware/audit');

const getAllComments = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;

    // Verify action item exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @actionItemId AND [IsDeleted] = 0`, { actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    const result = await executeQuery(`
      SELECT * FROM dbo.[ActionItemComments]
      WHERE [ActionItemId] = @actionItemId
      ORDER BY [DateCreated] ASC
    `, { actionItemId });

    return response.success(res, result.recordset);
  } catch (error) {
    next(error);
  }
};

const getCommentById = async (req, res, next) => {
  try {
    const { actionItemId, commentId } = req.params;

    const result = await executeQuery(`
      SELECT * FROM dbo.[ActionItemComments]
      WHERE [Id] = @commentId AND [ActionItemId] = @actionItemId
    `, { commentId, actionItemId });

    if (result.recordset.length === 0) return response.error(res, 'Comment not found', 404);
    return response.success(res, result.recordset[0]);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { actionItemId } = req.params;
    const { Comment } = req.body;
    const audit = getAuditValues(req.user, 'create');

    // Verify action item exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItems] WHERE [Id] = @actionItemId AND [IsDeleted] = 0`, { actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'ActionItem not found', 404);

    const result = await executeQuery(`
      INSERT INTO dbo.[ActionItemComments] ([ActionItemId], [Comment], [DateCreated], [CreatedBy], [DateUpdated])
      OUTPUT INSERTED.*
      VALUES (@ActionItemId, @Comment, @DateCreated, @CreatedBy, @DateUpdated)
    `, {
      ActionItemId: actionItemId,
      Comment,
      DateCreated: audit.DateCreated,
      CreatedBy: audit.CreatedBy,
      DateUpdated: audit.DateCreated
    });

    return response.success(res, result.recordset[0], 'Comment created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateComment = async (req, res, next) => {
  try {
    const { actionItemId, commentId } = req.params;
    const { Comment } = req.body;
    const audit = getAuditValues(req.user, 'update');

    // Verify comment exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItemComments] WHERE [Id] = @commentId AND [ActionItemId] = @actionItemId`, { commentId, actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Comment not found', 404);

    const result = await executeQuery(`
      UPDATE dbo.[ActionItemComments]
      SET [Comment] = @Comment, [DateUpdated] = @DateUpdated, [UpdatedBy] = @UpdatedBy
      WHERE [Id] = @commentId;
      SELECT * FROM dbo.[ActionItemComments] WHERE [Id] = @commentId
    `, {
      commentId,
      Comment,
      DateUpdated: audit.DateUpdated,
      UpdatedBy: audit.UpdatedBy
    });

    return response.success(res, result.recordset[0], 'Comment updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { actionItemId, commentId } = req.params;

    // Verify comment exists
    const checkResult = await executeQuery(`SELECT COUNT(*) AS cnt FROM dbo.[ActionItemComments] WHERE [Id] = @commentId AND [ActionItemId] = @actionItemId`, { commentId, actionItemId });
    if (checkResult.recordset[0].cnt === 0) return response.error(res, 'Comment not found', 404);

    await executeQuery(`DELETE FROM dbo.[ActionItemComments] WHERE [Id] = @commentId`, { commentId });

    return response.success(res, null, 'Comment deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllComments, getCommentById, createComment, updateComment, deleteComment };
